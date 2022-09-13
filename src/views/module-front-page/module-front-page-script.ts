const portletHeader = {
  scriptsToImport: ['https://code.jquery.com/jquery-3.2.1.min.js'],
  script: (data) => {
    return `      
            let moduleData = ${JSON.stringify(data)};
            $('.report-module').html(moduleData['moduleText']);

            if (moduleData['startDate'] && moduleData['endDate']) {
                $('.pdf-date-range').html(moduleData['startDate'] + ' - ' + moduleData['endDate']);
            } else if (moduleData['time']) {
                $('.pdf-date-range').html(moduleData['time']);
            }
        `;
  },
};

export default portletHeader;
