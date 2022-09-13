const headerHandler = {
  scriptsToImport: ['https://code.jquery.com/jquery-3.2.1.min.js'],
  script: (data) => {
    return `
            let pdfData = ${JSON.stringify(data)};
            let date = (new Date() + '').split(' ');
            let imageUrl = pdfData['imageUrl'] && pdfData['imageUrl'] != null ? pdfData['imageUrl'] : "https://s3.ap-south-1.amazonaws.com/centilytics.config.ap-south-1/defaultWebsite/whiteLogo.png";
            $('.report-gen-date').html('Generated on: ' + date[2] + ' ' + date[1] + ' ' + date[3]);      
            $('.report-logo').attr("src", imageUrl);
            let reportName = pdfData['reportName'] ? pdfData['reportName'] : '';
            let moduleList = pdfData['modules'] ? Object.keys(pdfData['modules']) : [];
            if (!pdfData['reportName'] && moduleList && moduleList.length) {
                    reportName = (pdfData['modules'][moduleList[0]]['insights'] && pdfData['modules'][moduleList[0]]['insights'].length 
                                && pdfData['modules'][moduleList[0]]['insights'][0]['data'] && 
                                pdfData['modules'][moduleList[0]]['insights'][0]['data']['insightText']
                                ) ?  pdfData['modules'][moduleList[0]]['insights'][0]['data']['insightText'] : '';  
            }

            $('.report-name').html(reportName);
        `;
  },
};

export default headerHandler;
