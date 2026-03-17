import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../../helper";
import { Link } from "react-router-dom";
// import img from "../../../../Assets/default.png";

const FeaturedComponent = ({ branchName }) => {
  const [products, setProducts] = useState([]);

  const getFeaturedProducts = async () => {
    try {
      if (branchName) {
        const { data } = await axios.get(
          `${API_URL}/product/featured-products?branch_name=${branchName}`
        );
        setProducts(data.data);
      }
    } catch (error) {
      console.log(error.response.data.message);
      alert(error.response.data.message.code);
    }
  };

  useEffect(() => {
    getFeaturedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchName]);

  return (
    <div className="flex flex-row flex-wrap justify-center py-2">
      {products.map((product) => (
        <Link key={product.id} to={`/product-detail/${product.id}`}>
          <div className="flex flex-row flex-wrap justify-center">
            <div
              className="flex-col justify-center box-content rounded drop-shadow-md 
                        h-44 w-32 bg-white text-xs m-2
                        hover:border border-[#86C649]"
            >
              <img className="h-20 w-20 mx-auto my-2" src={`http://localhost:8000/${product.product_img}`} alt="img" />
              <div className="text-center text-xs text-[#86C649]">
                Rp. {product.price.toLocaleString()},-
              </div>
              <div className="text-center text-sm font-medium product-name">
                {product.name}
              </div>
              <div className="text-center text-xs text-gray-500 font-light">
                {Math.ceil(product.weight)} gram
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedComponent;
