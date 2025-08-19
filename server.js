import express from "express";


const app = express();
const port = 3001;
import cors from "cors";

// Controllers
import { UserController } from "./controllers/UserController.js";
import { CompanyController } from "./controllers/CompanyController.js";
import { ProductController } from "./controllers/ProductController.js";
import { SellController } from "./controllers/SellController.js";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// Sell
app.post("/api/sell/create", SellController.create);

// buy
app.post("/api/buy/create", ProductController.create);
app.get("/api/buy/list", ProductController.list);
app.put("/api/buy/update/:id", ProductController.update);
app.delete("/api/buy/remove/:id", ProductController.remove);


// user
app.post("/api/user/signin", UserController.signIn);
app.get("/api/user/info", UserController.info);
app.put("/api/user/update", UserController.update);


// company
app.post("/api/company/create",  CompanyController.create);
app.get("/api/company/list", CompanyController.list);


app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
});

app.listen(port, () => {    
    console.log(`Server is running on http://localhost:${port}`);
});