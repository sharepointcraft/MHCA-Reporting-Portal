import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./SubCategory.module.scss";

interface ISubCategoryProps {
  context: any;
}

const SubCategory: React.FC<ISubCategoryProps> = ({ context }) => {
  const { deptName, categoryName } = useParams();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (deptName && categoryName) {
      const decodedDept = decodeURIComponent(deptName);
      const decodedCat = decodeURIComponent(categoryName);
      fetchSubCategories(decodedDept, decodedCat);
    }
  }, [deptName, categoryName]);

  const fetchSubCategories = async (decodedDept: string, decodedCat: string) => {
    try {
      const webUrl = context.pageContext.web.absoluteUrl;

      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Sub%20Category')/items?$select=Title,Category/Title,Department/Title&$expand=Category,Department&$filter=Department/Title eq '${decodedDept}' and Category/Title eq '${decodedCat}'`,
        {
          headers: { Accept: "application/json;odata=nometadata" },
        }
      );

      const data = await response.json();
      setSubCategories(data.value);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(`/${encodeURIComponent(deptName!)}`)}
      >
        ← Back to {decodeURIComponent(deptName!)} Categories
      </button>

      <h2 className={styles.heading}>
        {decodeURIComponent(categoryName!)} Subcategories
      </h2>

      {loading ? (
        <p>Loading subcategories...</p>
      ) : subCategories.length > 0 ? (
        <div className={styles.subCategoryGrid}>
          {subCategories.map((sub, i) => (
            <div key={i} className={styles.subCategoryCard}>
              <h4>{sub.Title}</h4>
            </div>
          ))}
        </div>
      ) : (
        <p>No subcategories found for {decodeURIComponent(categoryName!)}.</p>
      )}
    </div>
  );
};

export default SubCategory;
