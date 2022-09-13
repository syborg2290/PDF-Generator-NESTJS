const expandableTablePortlet = {
  templateFolderName: 'expandable-table-portlet',

  scriptsToImport: [],
  script: (data) => {
    return `
            (async () => {
                let data = ${JSON.stringify(data)};
                let htmlContent = '';
                $('.expandable-table-title').html(data['insightText']);
                if (Object.keys(data['dataList']).length === 0) {
                    $('.extra-message').css({'display': 'block'});
                    $('.expandable-table-container').css({'display': 'none'});
                    return;
                } 
                if (data['dataList'].length) {
                    data['dataList'].forEach(row => {
                        const heading = data['dataMap']['modalKeys'];
                        htmlContent += '<div class="expandable-table-content">'; 
                        htmlContent += '<div class="expandable-table-heading"><span class="highlight">' + row['modalData'][heading[0]]['columns'][0] + ' : </span>' +  row['modalData'][heading[0]]['data'][0][row['modalData'][heading[0]]['columns'][0]]  + '</div>';
                        htmlContent += '<table class="table-data-container">';
                        data['dataMap']['modalKeys'].forEach(key => {
                            if (row['modalData'][key]['data'].length) {
                                htmlContent += '<tr>'
                                htmlContent += '<td class="one">' + key + '</td>'; 
                                htmlContent += '<td class="' + (row['modalData'][key]['data'][0]['errorMessage'] ? 'two internal-extra-msg' : 'two') + '">';
                                    let columns = row['modalData'][key]['columns'];
                                    if (key === 'Tagging Info') {
                                        
                                        htmlContent += '<table class="tagging-info set-width">';
                                        htmlContent += '<tr>';
                                        columns.forEach(key => {
                                            htmlContent += '<th>' + key + '</th>';
                                        });
                                        htmlContent += '</tr>';
                                        //htmlContent += '<tbody>';
                                        row['modalData'][key]['data'].forEach(internalRow => {
                                            htmlContent += '<tr>';
                                            columns.forEach(tableKey => {
                                                htmlContent += '<td>' + internalRow[tableKey] + '</td>';      
                                            });
                                            htmlContent += '</tr>';
                                        });
                                        //htmlContent += '</tbody>';
                                        htmlContent += '</table>';
                                        
                                    } else { 
                                                                             
                                        if (!row['modalData'][key]['data'][0]['errorMessage']) {
                                            htmlContent += '<table>';
                                            row['modalData'][key]['data'].forEach(internalRow => {
                                                htmlContent += '<tr class="internal-row-parent"><td class="internal-row"> <table>';
                                                columns.forEach((internalKey, index) => {
                                                    if (index % 2 === 0) {
                                                        htmlContent += '<tr>';
                                                    }
                                                    htmlContent += '<td  class="two-content-row"> <span class="highlight">' + internalKey + ' : </span>' + internalRow[internalKey] + '</td>';
                                                    if (index % 2 !== 0) {
                                                        htmlContent += '</tr>';
                                                    }
                                                });
                                                htmlContent += '</table></td></tr>';
                                            });
                                            htmlContent += '</table>';
                                        } else {
                                            
                                                htmlContent += row['modalData'][key]['data'][0]['errorMessage'];    
        
                                        }
                                       
                                    }    
                                   
                                htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        });
                        htmlContent += '</table></div>';
                    });
                } 
                
                $('.expandable-table-container').html(htmlContent);
                
            })();  
        `;
  },
};

export default expandableTablePortlet;
