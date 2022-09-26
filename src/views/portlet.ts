import expandableTablePortlet from './expandable-table-portlet/expandable-table-portlet-script';
import mapPortlet from './map-portlet/map-portlet-script';
import piePortlet from './pie-portlet/pie-portlet-script';
import singleStackbarPortlet from './stack-bar-portlet/stack-bar-portlet-script';
import timeSeriesPortlet from './timeseries-portlet/time-series-portlet-script';

const portlets = {};

portlets['piev2'] = piePortlet;
portlets['timeseriesv2'] = timeSeriesPortlet;
portlets['regionalv2'] = mapPortlet;
portlets['expandabletable'] = expandableTablePortlet;
portlets['single_stacked_bar'] = singleStackbarPortlet;

export default portlets;
