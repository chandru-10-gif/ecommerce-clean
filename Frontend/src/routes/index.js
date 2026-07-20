import { Routes, Route } from "react-router-dom";
import Home from "../container/Home";

export default function Router() {
    return (
        <Routes>
            <Route path="*" element={<Home />} />
        </Routes>
    );
}