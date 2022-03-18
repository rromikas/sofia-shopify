const Button = ({ style, ...rest }) => {
  return (
    <button
      {...rest}
      type="submit"
      style={{
        width: "100%",
        height: 46,
        background: "#5372F5",
        color: "white",
        borderRadius: 100,
        border: "none",
        margin: "0 auto",
        cursor: "pointer",
        fontSize: 16,
        ...style,
      }}
    ></button>
  );
};

export default Button;
