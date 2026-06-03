import { useNavigate } from "react-router-dom";

export default function BackButton() {

  const navigate = useNavigate();

  return (
    <button
      className="btn btn-dark position-fixed top-70px start-0 m-3"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
  );
}