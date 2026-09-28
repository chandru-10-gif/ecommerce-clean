import { useNavigate } from "react-router-dom";

export const categories = [
  {
    name: "Electronics",
    image: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
    value: "electronics",
    subcategories: [
      { name: "Mobiles", value: "mobiles", icon: "https://cdn-icons-png.flaticon.com/512/0/191.png" },
      { name: "Laptops", value: "laptops", icon: "https://cdn-icons-png.flaticon.com/512/687/687664.png" },
      { name: "Headphones", value: "headphones", icon: "https://cdn-icons-png.flaticon.com/512/2515/2515279.png" },
      { name: "Cameras", value: "cameras", icon: "https://cdn-icons-png.flaticon.com/512/74/74441.png" },
      { name: "Accessories", value: "accessories", icon: "https://cdn-icons-png.flaticon.com/512/2593/2593635.png" },
    ],
  },
  {
    name: "Fashion",
    image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
    value: "fashion",
    subcategories: [
      { name: "Men", value: "men's clothing", icon: "https://cdn-icons-png.flaticon.com/512/1998/1998722.png" },
      { name: "Women", value: "women's clothing", icon: "https://cdn-icons-png.flaticon.com/512/2922/2922567.png" },
      { name: "Kids", value: "kids clothing", icon: "https://cdn-icons-png.flaticon.com/512/1154/1154460.png" },
      { name: "Footwear", value: "footwear", icon: "https://cdn-icons-png.flaticon.com/512/146/146820.png" },
    ],
  },
  {
    name: "Jewellery",
    image: "https://cdn-icons-png.flaticon.com/512/3082/3082037.png",
    value: "jewellery",
    subcategories: [
      { name: "Gold", value: "gold", icon: "https://cdn-icons-png.flaticon.com/512/3082/3082099.png" },
      { name: "Silver", value: "silver", icon: "https://cdn-icons-png.flaticon.com/512/992/992743.png" },
      { name: "Diamond", value: "diamond", icon: "https://cdn-icons-png.flaticon.com/512/1156/1156930.png" },
      { name: "Rings", value: "rings", icon: "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" },
    ],
  },
  {
    name: "Home",
    image: "https://cdn-icons-png.flaticon.com/512/619/619153.png",
    value: "home",
    subcategories: [
      { name: "Furniture", value: "furniture", icon: "https://cdn-icons-png.flaticon.com/512/2276/2276897.png" },
      { name: "Kitchen", value: "kitchen", icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" },
      { name: "Decor", value: "decor", icon: "https://cdn-icons-png.flaticon.com/512/1048/1048951.png" },
      { name: "Bedding", value: "bedding", icon: "https://cdn-icons-png.flaticon.com/512/3371/3371362.png" },
    ],
  },
];

const allSubcategories = [
  { name: "Mobiles", value: "mobiles", icon: "https://cdn-icons-png.flaticon.com/512/0/191.png" },
  { name: "Laptops", value: "laptops", icon: "https://cdn-icons-png.flaticon.com/512/687/687664.png" },
  { name: "Footwear", value: "footwear", icon: "https://cdn-icons-png.flaticon.com/512/146/146820.png" },
  { name: "Furniture", value: "furniture", icon: "https://cdn-icons-png.flaticon.com/512/2276/2276897.png" },
  { name: "Kitchen", value: "kitchen", icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" },
];

export default function CategorySection() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "15px 0" }}>
      <div className="category-scroll">
        {allSubcategories.map((item) => (
          <div
            key={item.value}
            className="category-icon-item"
            onClick={() => navigate(`/category/${item.value}`)}
          >
            <div className="category-icon-circle">
              <img src={item.icon} alt={item.name} />
            </div>
            <span className="category-icon-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
