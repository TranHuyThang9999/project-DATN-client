import React, { useState } from 'react';
import { Button, Table, Upload, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'; // Thêm DownloadOutlined từ ant-design/icons
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function ShiftAdd() {
    const [excelData, setExcelData] = useState(null);

    const handleFileUpload = (info) => {
        const file = info.file;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Assuming only one sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            setExcelData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    const sendDataToApi = async () => {
        try {
            // Tạo mảng các đối tượng JSON theo yêu cầu của API
            const formattedData = excelData.slice(1).map(row => ({
                user_name: row[0],
                shift_names: row[1],
                cinema_name: row[2],
                age: row[3],
                address: row[4]
            }));

            // Gửi dữ liệu đã được định dạng lại lên API sử dụng axios
            const response = await axios.post('http://localhost:8080/manager/user/add/staff', formattedData);
            console.log(response.data);
            message.success('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            message.error('Failed to save data. Please try again later.');
        }
    };

    const exportToExcel = () => {
        if (!excelData) return;

        const sheet = XLSX.utils.aoa_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
        XLSX.writeFile(workbook, 'export.xlsx');
    };

    const columns = excelData ? excelData[0].map((header, index) => ({ title: header, dataIndex: index.toString() })) : [];

    return (
        <div>
            <Upload
                beforeUpload={() => false}
                onChange={handleFileUpload}
                showUploadList={false}
            >
                <Button>
                    <UploadOutlined /> Upload file excel
                </Button>
            </Upload>
            {excelData && (
                <div>
                    <Table dataSource={excelData.slice(1)} columns={columns} />
                    <Button onClick={sendDataToApi}>Send Data to API</Button>
                    <Button onClick={exportToExcel} style={{ marginLeft: '10px' }}>
                        <DownloadOutlined /> Export to Excel
                    </Button>
                </div>
            )}
        </div>
    );
}
