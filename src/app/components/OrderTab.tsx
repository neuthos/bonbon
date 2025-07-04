"use client";
import {useState, useEffect} from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Tag,
  DatePicker,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  FilterOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import type {ColumnsType} from "antd/es/table";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as XLSX from "xlsx";

dayjs.extend(isBetween);

const {RangePicker} = DatePicker;

interface Product {
  id: string;
  code: string;
  name: string;
  color: string;
  priceModal: number;
  priceJual: number;
}

interface Order {
  id: string;
  date: string;
  productCode: string;
  quantity: number;
  discount: number;
  admin: number;
  status: string;
  product: Product;
}

export default function OrderTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    // Check if mobile after component mounts
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch products");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.append("fromDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("toDate", dateRange[1].format("YYYY-MM-DD"));
      }

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingOrder
        ? `/api/orders/${editingOrder.id}`
        : "/api/orders";
      const method = editingOrder ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          ...values,
          date: values.date.format("YYYY-MM-DD"),
        }),
      });

      if (response.ok) {
        message.success(
          editingOrder
            ? "Order updated successfully"
            : "Order added successfully"
        );
        form.resetFields();
        setIsModalOpen(false);
        setEditingOrder(null);
        fetchOrders();
      } else {
        message.error("Failed to save order");
      }
    } catch (error) {
      message.error("Failed to save order");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Order deleted successfully");
        fetchOrders();
      } else {
        message.error("Failed to delete order");
      }
    } catch (error) {
      message.error("Failed to delete order");
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      date: dayjs(order.date),
      productCode: order.productCode,
      quantity: order.quantity,
      discount: order.discount,
      admin: order.admin,
      status: order.status,
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: newStatus}),
      });

      if (response.ok) {
        message.success("Status updated successfully");
        fetchOrders();
      } else {
        message.error("Failed to update status");
      }
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const calculateOrderValues = (order: Order) => {
    const totalHargaJual = order.product.priceJual * order.quantity;
    const totalBayar = order.product.priceModal * order.quantity;
    const keuntungan =
      totalHargaJual - order.discount - order.admin - totalBayar;

    return {totalHargaJual, totalBayar, keuntungan};
  };

  const filteredOrders = orders.filter((order) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
    const orderDate = dayjs(order.date);
    const startDate = dateRange[0].startOf("day");
    const endDate = dateRange[1].endOf("day");
    return (
      (orderDate.isAfter(startDate) && orderDate.isBefore(endDate)) ||
      orderDate.isSame(startDate, "day") ||
      orderDate.isSame(endDate, "day")
    );
  });

  const stats = filteredOrders.reduce(
    (acc, order) => {
      const {totalBayar, keuntungan} = calculateOrderValues(order);

      acc.totalBayar += totalBayar;
      acc.totalKeuntungan += keuntungan;

      if (order.status === "Sudah Dibayar") {
        acc.sudahDibayar += totalBayar;
      } else if (order.status === "Belum Dibayar") {
        acc.belumDibayar += totalBayar;
      }

      return acc;
    },
    {
      totalBayar: 0,
      totalKeuntungan: 0,
      sudahDibayar: 0,
      belumDibayar: 0,
    }
  );

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order) => {
      const {totalBayar, keuntungan} = calculateOrderValues(order);
      return {
        Tanggal: dayjs(order.date).format("DD/MM/YYYY"),
        "Code Produk": order.productCode,
        "Nama Produk": order.product.name,
        Warna: order.product.color,
        Quantity: order.quantity,
        "Harga Modal": order.product.priceModal,
        "Harga Jual": order.product.priceJual,
        Diskon: order.discount,
        Admin: order.admin,
        "Total Bayar ke Supplier": totalBayar,
        Keuntungan: keuntungan,
        Status: order.status,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    const fileName = `orders_${dayjs().format("YYYY-MM-DD")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success("Data exported successfully");
  };

  const downloadBackup = async () => {
    try {
      const response = await fetch("/api/backup");
      const data = await response.json();

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], {type: "application/json"});
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.json`;
      link.click();

      URL.revokeObjectURL(url);
      message.success("Backup downloaded successfully");
    } catch (error) {
      message.error("Failed to download backup");
    }
  };

  const selectedProduct = products.find(
    (p) => p.code === form.getFieldValue("productCode")
  );

  const columns: ColumnsType<Order> = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD/MM"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      width: 80,
    },
    {
      title: "Code",
      dataIndex: "productCode",
      key: "productCode",
      render: (text) => (
        <Tag color="blue" className="text-xs">
          {text}
        </Tag>
      ),
      width: 120,
      ellipsis: true,
    },
    {
      title: "Produk",
      dataIndex: ["product", "name"],
      key: "productName",
      ellipsis: true,
      responsive: ["sm"],
    },
    {
      title: "Warna",
      dataIndex: ["product", "color"],
      key: "color",
      render: (text) => (
        <Tag color="green" className="text-xs">
          {text}
        </Tag>
      ),
      width: 80,
      responsive: ["md"],
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 50,
    },
    {
      title: "Total Bayar",
      key: "totalBayar",
      render: (_, record) => {
        const {totalBayar} = calculateOrderValues(record);
        return <span className="text-xs">{totalBayar.toLocaleString()}</span>;
      },
      width: 90,
    },
    {
      title: "Untung",
      key: "keuntungan",
      render: (_, record) => {
        const {keuntungan} = calculateOrderValues(record);
        return (
          <span
            className="text-xs"
            style={{color: keuntungan >= 0 ? "#52c41a" : "#ff4d4f"}}
          >
            {keuntungan.toLocaleString()}
          </span>
        );
      },
      width: 80,
      responsive: ["sm"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          style={{width: 90}}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Select.Option value="Belum Dibayar">
            <Tag color="orange" className="text-xs">
              Belum
            </Tag>
          </Select.Option>
          <Select.Option value="Sudah Dibayar">
            <Tag color="green" className="text-xs">
              Sudah
            </Tag>
          </Select.Option>
          <Select.Option value="Return">
            <Tag color="red" className="text-xs">
              Return
            </Tag>
          </Select.Option>
        </Select>
      ),
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger size="small">
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 80,
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Orders</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={downloadBackup} size="small">
            Backup
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={filteredOrders.length === 0}
            size="small"
          >
            Excel
          </Button>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            size="small"
          >
            Add
          </Button>
        </div>
      </div>

      <Card size="small" className="mb-4">
        <div className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span>Filter:</span>
          </div>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            size="small"
            style={{width: "100%", maxWidth: 250}}
          />
        </div>

        <Row gutter={[8, 8]}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Bayar"
                value={stats.totalBayar}
                precision={0}
                valueStyle={{color: "#1677ff", fontSize: "14px"}}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Sudah Bayar"
                value={stats.sudahDibayar}
                precision={0}
                valueStyle={{color: "#52c41a", fontSize: "14px"}}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Belum Bayar"
                value={stats.belumDibayar}
                precision={0}
                valueStyle={{color: "#faad14", fontSize: "14px"}}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Keuntungan"
                value={stats.totalKeuntungan}
                precision={0}
                valueStyle={{
                  color: stats.totalKeuntungan >= 0 ? "#52c41a" : "#ff4d4f",
                  fontSize: "14px",
                }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          size: "small",
          showSizeChanger: false,
          responsive: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        size="small"
        scroll={{x: 800}}
      />

      <Modal
        title={editingOrder ? "Edit Order" : "Add Order"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? "95%" : 600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tanggal"
                name="date"
                rules={[{required: true, message: "Please select date!"}]}
              >
                <DatePicker style={{width: "100%"}} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Produk"
            name="productCode"
            rules={[{required: true, message: "Please select product!"}]}
          >
            <Select placeholder="Pilih Produk" showSearch>
              {products.map((product) => (
                <Select.Option key={product.id} value={product.code}>
                  {product.code} - {product.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedProduct && (
            <Card size="small" className="mb-4">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Produk:</strong> {selectedProduct.name}
                </div>
                <div>
                  <strong>Warna:</strong> {selectedProduct.color}
                </div>
                <div>
                  <strong>Modal:</strong>{" "}
                  {selectedProduct.priceModal.toLocaleString()}
                </div>
                <div>
                  <strong>Jual:</strong>{" "}
                  {selectedProduct.priceJual.toLocaleString()}
                </div>
              </div>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{required: true, message: "Please input quantity!"}]}
              >
                <InputNumber min={1} style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{required: true, message: "Please select status!"}]}
              >
                <Select>
                  <Select.Option value="Belum Dibayar">
                    Belum Dibayar
                  </Select.Option>
                  <Select.Option value="Sudah Dibayar">
                    Sudah Dibayar
                  </Select.Option>
                  <Select.Option value="Return">Return</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Diskon" name="discount" initialValue={0}>
                <InputNumber
                  min={0}
                  style={{width: "100%"}}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Admin" name="admin" initialValue={0}>
                <InputNumber
                  min={0}
                  style={{width: "100%"}}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="primary" htmlType="submit" block={isMobile}>
                {editingOrder ? "Update" : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingOrder(null);
                  form.resetFields();
                }}
                block={isMobile}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
