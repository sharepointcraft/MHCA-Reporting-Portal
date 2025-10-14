import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Category.module.scss";

interface ICategoryProps {
  context: any;
}

const Category: React.FC<ICategoryProps> = ({ context }) => {
  const { deptName } = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<{ [key: string]: any[] }>({});
  const [reports, setReports] = useState<{ [key: string]: any[] }>({});
  const [expandedSub, setExpandedSub] = useState<{ [key: string]: boolean }>({});
  const [loadingReports, setLoadingReports] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (deptName) {
      fetchCategories(decodeURIComponent(deptName));
    }
  }, [deptName]);

  const fetchCategories = async (department: string) => {
    try {
      const webUrl = context.pageContext.web.absoluteUrl;
      
      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Category')/items?$select=Title,ID,Department/Title&$expand=Department&$filter=Department/Title eq '${department.replace(/'/g, "''")}'`,
        { headers: { Accept: "application/json;odata=nometadata" } }
      );
      const data = await response.json();
      setCategories(data.value);

      // Fetch subcategories for all categories
      data.value.forEach((cat: any) => fetchSubCategories(cat.Title));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async (categoryName: string) => {
    try {
      const webUrl = context.pageContext.web.absoluteUrl;
      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Sub%20Category')/items?$select=Title,image,Category/Title&$expand=Category&$filter=Category/Title eq '${categoryName.replace(/'/g, "''")}'`,
        { headers: { Accept: "application/json;odata=nometadata" } }
      );
      const data = await response.json();
      setSubCategories((prev) => ({ ...prev, [categoryName]: data.value }));
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchReports = async (subCategoryName: string) => {
    const key = subCategoryName;
    
    // Don't fetch if already loaded
    if (reports[key]) return;

    setLoadingReports((prev) => ({ ...prev, [key]: true }));

    try {
      const webUrl = context.pageContext.web.absoluteUrl;
      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Reports')/items?$select=Title,ReportURL,Description,SubCategory/Title&$expand=SubCategory&$filter=SubCategory/Title eq '${subCategoryName.replace(/'/g, "''")}'`,
        { headers: { Accept: "application/json;odata=nometadata" } }
      );
      const data = await response.json();
      setReports((prev) => ({ ...prev, [key]: data.value }));
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReports((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleSub = (categoryName: string, subName: string) => {
    const key = `${categoryName}-${subName}`;
    const isExpanding = !expandedSub[key];

    setExpandedSub((prev) => ({ ...prev, [key]: isExpanding }));

    // Fetch reports when expanding
    if (isExpanding) {
      fetchReports(subName);
    }
  };

  const openReport = (reportUrl: string) => {
    if (reportUrl) {
      // Handle both string URLs and SharePoint Hyperlink field objects
      const url = typeof reportUrl === "string" 
        ? reportUrl 
        : (reportUrl as any).Url || (reportUrl as any).url;
      
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        {deptName ? decodeURIComponent(deptName) : "FinanceHQ"} Categories
      </h2>

      <div className={styles.categoryRow}>
        {categories.length > 0 ? (
          categories.map((cat, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>{cat.Title}</div>

              <div className={styles.subCategoryList}>
                {subCategories[cat.Title]?.length ? (
                  subCategories[cat.Title].map((sub, i) => {
                    // Determine image URL
                    let imageUrl = "";
                    if (sub.image) {
                      if (typeof sub.image === "string") {
                        imageUrl = sub.image.split(",")[0];
                      } else if ((sub.image as any).Url) {
                        imageUrl = (sub.image as any).Url;
                      }
                    }

                    const expandKey = `${cat.Title}-${sub.Title}`;
                    const isExpanded = expandedSub[expandKey];
                    const subReports = reports[sub.Title] || [];
                    const isLoading = loadingReports[sub.Title];

                    return (
                      <div key={i} className={styles.subCategoryItem}>
                        <div
                          className={styles.subCategoryHeader}
                          onClick={() => toggleSub(cat.Title, sub.Title)}
                        >
                          <div className={styles.subCategoryInfo}>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={sub.Title}
                                className={styles.subCategoryIcon}
                              />
                            ) : (
                              <span className={styles.defaultIcon}>📋</span>
                            )}
                            <span>{sub.Title}</span>
                          </div>
                          <span className={styles.toggleIcon}>
                            {isExpanded ? "−" : "+"}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className={styles.reportList}>
                            {isLoading ? (
                              <p className={styles.loadingText}>Loading reports...</p>
                            ) : subReports.length > 0 ? (
                              <ul className={styles.reportItems}>
                                {subReports.map((report, idx) => (
                                  <li
                                    key={idx}
                                    className={styles.reportItem}
                                    onClick={() => openReport(report.ReportURL)}
                                    title={report.Description || report.Title}
                                  >
                                    {/* <span className={styles.reportIcon}>📊</span> */}
                                    <span className={styles.reportName}>{report.Title}</span>
                                    <span className={styles.externalIcon}>↗</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className={styles.noReports}>No reports available</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className={styles.noSub}>No subcategories</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noCategories}>
            No categories found for {deptName ? decodeURIComponent(deptName) : "this department"}.
          </p>
        )}
      </div>
    </div>
  );
};

export default Category;