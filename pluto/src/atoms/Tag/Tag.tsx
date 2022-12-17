import { AiOutlineClose } from "react-icons/ai";

import { ComponentSizeTypographyLevels, Text, TextProps } from "@/atoms/Typography";
import { ComponentSize } from "@/util";
import "./Tag.css";

export interface TagProps extends Omit<TextProps, "level"> {
  icon?: React.ReactElement;
  onClose?: () => void;
  color?: string;
  size?: ComponentSize;
  variant?: "filled" | "outlined";
}

export const Tag = ({
  children = "",
  size = "medium",
  variant = "filled",
  color = "var(--pluto-primary-z)",
  icon,
  onClose,
  style,
  ...props
}: TagProps): JSX.Element => {
  const closeIcon =
    onClose == null ? undefined : (
      <AiOutlineClose
        aria-label="close"
        className="pluto-tag__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
    );
  return (
    <Text.WithIcon
      endIcon={closeIcon}
      startIcon={icon}
      className="pluto-tag"
      level={ComponentSizeTypographyLevels[size]}
      style={{
        border: `var(--pluto-border-width) solid ${color}`,
        backgroundColor: variant === "filled" ? color : "transparent",
        ...style,
      }}
      {...props}
    >
      {children}
    </Text.WithIcon>
  );
};
