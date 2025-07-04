"use client";
import {ConfigProvider} from "antd";

export function ThemeProvider({children}: {children: React.ReactNode}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
