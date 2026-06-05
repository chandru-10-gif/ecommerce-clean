import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "15px",
      }}
    >
      <button
        className="btn btn-dark"
        onClick={() => navigate(-1)}
      >
        ← 
      </button>
    </div>
  );
}