import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import ReportingPortal from './components/ReportingPortal';
import { IReportingPortalProps } from './components/IReportingPortalProps';
export interface IReportingPortalWebPartProps {
  description: string;
}

export default class ReportingPortalWebPart extends BaseClientSideWebPart<IReportingPortalWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IReportingPortalProps> = React.createElement(
      ReportingPortal,
      { context: this.context } // ✅ Pass context here

    );

    ReactDom.render(element, this.domElement);
  }

}
