import { useDispatch } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import { setToken,setLoading } from "./redux/slices/authSlice";
import { useEffect } from "react";
import Navbar from "./components/Navbar";


function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  console.log("App Token:", token);

  useEffect(() => {
    if (token) {
      dispatch(setToken(token));
      
    }
    dispatch(setLoading(false));
  }, [token]);

  return (
    <>
      <Navbar/>
      <AppRoutes />
      
    </>
  );
}

export default App;
