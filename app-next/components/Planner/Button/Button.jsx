import styles from "./Button.module.css";

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}) {
  const buttonStyle =
    variant === "secondary" ? styles.secondary : styles.primary;

  const handleClick = (e) => {
    console.log(`Button clicked: "${children}"`);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${styles.actionButton} ${buttonStyle} ${className}`}
    >
      {children}
    </button>
  );
}
