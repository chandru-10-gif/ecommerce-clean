import React, {useState} from "react";
import {supabase} from "../services/supabase";
import "../styles/ReviewBox.css";

export default function ReviewBox({productId, closeModal}) {

  const [rating,setRating] = useState(0);
  const [comment,setComment] = useState("");
  const [loading,setLoading] = useState(false);


  const submitReview = async()=>{


    if(rating === 0){
      alert("Please select star rating");
      return;
    }


    const {data:userData} = await supabase.auth.getUser();


    if(!userData.user){
      alert("Please login first");
      return;
    }


    setLoading(true);


    const {error} = await supabase
    .from("product_reviews")
    .insert({

      product_id: productId,

      user_id: userData.user.id,

      rating: rating,

      comment: comment

    });


    setLoading(false);



    if(error){

      console.log(error);
      alert(error.message);

    }
    else{

      alert("Review added successfully");

      setRating(0);
      setComment("");

    }


  };



return (

<div className="review-box">


<h3>Rate this Product</h3>


<div className="stars">

{
[1,2,3,4,5].map((star)=>(

<span

key={star}

onClick={()=>setRating(star)}

style={{
fontSize:"32px",
cursor:"pointer",
color: star <= rating ? "orange":"gray"
}}

>

★


</span>


))

}

</div>



<textarea

placeholder="Write your feedback"

value={comment}

onChange={(e)=>setComment(e.target.value)}

/>



<button onClick={submitReview}>

{
loading ? "Submitting..." : "Submit Review"
}

</button>



</div>

)

}