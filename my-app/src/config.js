const config = {
  apiUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : "https://tfx7qlzln6pwxdrv6rp5bqv4c40expet.lambda-url.us-east-1.on.aws",
};

export default config;
