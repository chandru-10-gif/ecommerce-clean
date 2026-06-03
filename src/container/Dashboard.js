import React from "react";
import ProductCart from "../components/ProductCart";

export default function Dashboard({
  search,
  products,
  singleProductLoading,
  setSingleProductLoading,
  loading
}) {

const filteredProducts=
products.filter((product)=>
product?.title
?.toLowerCase()
.includes(search.toLowerCase())
);

return(

<div className="bg-white p-3">

<div className="d-flex flex-wrap justify-content-center gap-3">

{loading ? (

[1,2,3,4,5,6].map((item)=>(

<div
key={item}
className="skeleton-card"
>

<div className="skeleton-image"></div>

<div className="skeleton-text"></div>

<div className="skeleton-text short"></div>

</div>

))

) : (

filteredProducts.map((product)=>(

<ProductCart
key={product.id}
{...product}
singleProductLoading={
singleProductLoading
}
setSingleProductLoading={
setSingleProductLoading
}
/>

))

)}

</div>

</div>

);

}