"use client";
import {useState, useEffect} from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import {PlusOutlined, DeleteOutlined, LinkOutlined} from "@ant-design/icons";
import type {ColumnsType} from "antd/es/table";

interface Product {
  id: string;
  code: string;
  name: string;
  color: string;
  priceModal: number;
  priceJual: number;
  link: string;
}

export default function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();

    // Check if mobile after component mounts
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Product added successfully");
        form.resetFields();
        setIsModalOpen(false);
        fetchProducts();
      } else {
        message.error("Failed to add product");
      }
    } catch (error) {
      message.error("Failed to add product");
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await fetch(`/api/products/${code}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Product deleted successfully");
        fetchProducts();
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to delete product");
      }
    } catch (error) {
      message.error("Failed to delete product");
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 150,
    },
    {
      title: "Produk",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Warna",
      dataIndex: "color",
      key: "color",
      render: (text) => <Tag color="green">{text}</Tag>,
      width: 100,
    },
    {
      title: "Modal",
      dataIndex: "priceModal",
      key: "priceModal",
      render: (value) => `${value.toLocaleString()}`,
      width: 100,
      responsive: ["sm"],
    },
    {
      title: "Jual",
      dataIndex: "priceJual",
      key: "priceJual",
      render: (value) => `${value.toLocaleString()}`,
      width: 100,
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (text) =>
        text ? (
          <Button type="link" href={text} target="_blank" size="small" />
        ) : (
          "-"
        ),
      width: 60,
      responsive: ["md"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete product"
          description="Are you sure?"
          onConfirm={() => handleDelete(record.code)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger size="small" />
        </Popconfirm>
      ),
      width: 60,
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Inventory</h2>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          block={isMobile}
        >
          Add Product
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          size: "small",
          showSizeChanger: false,
          responsive: true,
        }}
        size="small"
        scroll={{x: 600}}
      />

      <Modal
        title="Add New Product"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={isMobile ? "90%" : 500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nama Produk"
            name="name"
            rules={[{required: true, message: "Please input product name!"}]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Warna"
            name="color"
            rules={[{required: true, message: "Please input color!"}]}
          >
            <Input />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Harga Modal"
              name="priceModal"
              rules={[{required: true, message: "Please input modal price!"}]}
            >
              <InputNumber
                style={{width: "100%"}}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Harga Jual"
              name="priceJual"
              rules={[{required: true, message: "Please input selling price!"}]}
            >
              <InputNumber
                style={{width: "100%"}}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </div>

          <Form.Item label="Link Produk" name="link">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="primary" htmlType="submit" block={isMobile}>
                Save
              </Button>
              <Button onClick={() => setIsModalOpen(false)} block={isMobile}>
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
