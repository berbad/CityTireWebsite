const config = {
  apiUrl: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000'  // Local development API URL
      : 'https://tfx7qlzln6pwxdrv6rp5bqv4c40expet.lambda-url.us-east-1.on.aws',  // Deployed Lambda API URL
};

export default config;

// todo: make api url dynamically work with local vs deployed
// "start:local": "react-scripts start NODE_ENV=local",


  