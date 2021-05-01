const app = require("./app");

const listener = () => console.log(`Server is running!`);
app.listen(3000, listener);