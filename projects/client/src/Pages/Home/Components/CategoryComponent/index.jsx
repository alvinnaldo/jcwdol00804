import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../../helper";
import img from "../../../../Assets/default.png";

const CategoryComponent = ({ branchName }) => {
  const [categoryList, setCategoryList] = useState([]);

  const fetchCategories = async () => {
    try {
      if (branchName) {
        const { data } = await axios.get(
          `${API_URL}/category/categories?branch_name=${branchName}`
        );
        setCategoryList(data.data);
      }
    } catch (error) {
      alert(error.response.data.message.code);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [branchName]);

  return (
    <div className="flex flex-row flex-wrap justify-center py-2">
      {categoryList.map((category) => {
        return (
          <Link
            className="hover:bg-[#86C649] hover:rounded-md hover:text-white"
            key={category.id}
            to={`/product-list`}
            state={{ from: category.name }}
          >
            <div className="box-content rounded h-16 w-16 bg-white text-xs text-center mx-2 mt-2 mb-10">
              {category.category_img === null ? (
                <img
                  className="rounded-md h-16 w-16 mx-auto my-2"
                  src={img}
                  alt="default"
                />
              ) : (
                <img
                  className="rounded-md h-16 w-16 mx-auto my-2"
                  src={
                    category.category_img &&
                    `http://localhost:8000/${category.category_img}`
                  }
                  alt="category_img"
                />
              )}
              <div className="text-center mt-2">{category.name}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryComponent;
