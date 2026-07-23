import { useNavigate } from "react-router-dom";


export const categories = [
  {
    name: "Electronics",
    image: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
    value: "electronics",
    subcategories: [
      { name: "Mobiles", value: "mobiles" },
      { name: "Laptops", value: "laptops" },
      { name: "Headphones", value: "headphones" },
      { name: "Cameras", value: "cameras" },
    ],
  },
  {
    name: "Fashion",
    image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
    value: "fashion",
    subcategories: [
      { name: "Men's Clothing", value: "men's clothing" },
      { name: "Women's Clothing", value: "women's clothing" },
      { name: "Kids Clothing", value: "kids clothing" },
      { name: "Footwear", value: "footwear" },
    ],
  },
  {
    name: "Jewelry",
    image: "https://cdn-icons-png.flaticon.com/512/3082/3082037.png",
    value: "jewelery",
    subcategories: [
      { name: "Gold", value: "gold" },
      { name: "Silver", value: "silver" },
      { name: "Diamond", value: "diamond" },
      { name: "Rings", value: "rings" },
    ],
  },
  {
    name: "Home",
    image: "https://cdn-icons-png.flaticon.com/512/619/619153.png",
    value: "home",
    subcategories: [
      { name: "Furniture", value: "furniture" },
      { name: "Kitchen", value: "kitchen" },
      { name: "Decor", value: "decor" },
      { name: "Bedding", value: "bedding" },
    ],
  },
];

export default function CategorySection() {
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <h3 className="fw-bold mb-4">Shop by Category</h3>

      <div className="row g-4">
        {categories.map((item) => (
          <div
            key={item.name}
            className="col-6 col-md-3"
            onClick={() => navigate(`/category/${item.value}`)}
          >
            <div className="category-card">
              <img src={item.image} alt={item.name} />
              <h6>{item.name}</h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}