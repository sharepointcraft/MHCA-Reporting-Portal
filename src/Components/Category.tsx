import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Category.module.scss";

interface ICategoryProps {
  context: any;
}

const Category: React.FC<ICategoryProps> = ({ context }) => {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (deptName) {
      const decodedName = decodeURIComponent(deptName);
      fetchCategories(decodedName);
    }
  }, [deptName]);

  const fetchCategories = async (decodedName: string) => {
    try {
      const webUrl = context.pageContext.web.absoluteUrl;

      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Category')/items?$select=Title,Department/Title&$expand=Department&$filter=Department/Title eq '${decodedName}'`,
        {
          headers: { Accept: "application/json;odata=nometadata" },
        }
      );

      const data = await response.json();
      console.log("Fetched Categories:", data.value);
      setCategories(data.value);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <h2 className={styles.heading}>{decodeURIComponent(deptName!)} Categories</h2>

      <div className={styles.categoryRow}>
        {categories.length > 0 ? (
          categories.map((cat, index) => (
            <div key={index} className={styles.categoryCard}>
              <h4>{cat.Title}</h4>
            </div>
          ))
        ) : (
          <p>No categories found for {decodeURIComponent(deptName!)}.</p>
        )}
      </div>
    </div>
  );
};

export default Category;
