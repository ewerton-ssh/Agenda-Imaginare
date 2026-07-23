import { Oval } from "react-loader-spinner";

function FullScreenLoader() {
  return (
    <div style={styles.container}>
      <Oval
        height={80}
        width={80}
        color="#85FF66"
        secondaryColor="#1a1a1a"
        strokeWidth={4}
        strokeWidthSecondary={4}
      />
    </div>
  );
}

const styles = {
  container: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
};

export default FullScreenLoader;