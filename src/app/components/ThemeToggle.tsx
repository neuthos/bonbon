"use client";
import {Button} from "antd";
import {Lightbulb, MoonIcon} from "lucide-react";
import {useTheme} from "../context/ThemeContext";

export default function ThemeToggle() {
  const {theme, setTheme} = useTheme();

  const themes = [
    {value: "light", icon: <Lightbulb />, label: "Light"},
    {value: "dark", icon: <MoonIcon />, label: "Dark"},
  ];

  return (
    <Button.Group>
      {themes.map(({value, icon, label}) => (
        <Button
          key={value}
          type={theme === value ? "primary" : "default"}
          icon={icon}
          onClick={() => setTheme(value as any)}
        >
          {label}
        </Button>
      ))}
    </Button.Group>
  );
}
