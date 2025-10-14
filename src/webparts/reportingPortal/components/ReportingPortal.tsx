import * as React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import type { IReportingPortalProps } from "./IReportingPortalProps";
import Home from "../../../Components/Home";
import Category from "../../../Components/Category";
import SubCategory from "../../../Components/SubCategory";

export default class ReportingPortal extends React.Component<IReportingPortalProps> {
  public render(): React.ReactElement<IReportingPortalProps> {
    const { context } = this.props;

    return (
      <div id="reporting-portal-root">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home context={context} />} />
            <Route path="/:deptName" element={<Category context={context} />} />
            <Route path="/:deptName/:categoryName" element={<SubCategory context={context} />} />
          </Routes>
        </HashRouter>
      </div>
    );
  }
}