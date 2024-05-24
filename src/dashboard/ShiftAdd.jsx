import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import './index.css';
import * as XLSX from 'xlsx';

export default function ShiftAdd() {
    const [formData, setFormData] = useState({
        employeeName: '',
        shift: '',
        cinemaName: '',
        age: '',
        address: '',
        workDate: ''
    });

    const layout = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 16,
        },
    };

    const handleChange = (e, field) => {
        const { value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleExportData = () => {
        // Kiểm tra xem có đầy đủ thông tin hay không
        if (formData.employeeName && formData.shift && formData.cinemaName && formData.age && formData.address && formData.workDate) {
            // Tạo một đối tượng mới để chứa dữ liệu
            const dataToExport = {
                'Tên nhân viên	': formData.employeeName,
                'Ca làm việc': formData.shift,
                'Tên rạp': formData.cinemaName,
                'Tuổi': formData.age,
                'Địa chỉ': formData.address,
                'Ngày làm việc': formData.workDate
            };

            // Tạo một mảng chứa đối tượng mới
            const dataArray = [dataToExport];

            // Tạo workbook và worksheet từ mảng dữ liệu
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(dataArray);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

            // Xuất file Excel và tải xuống
            XLSX.writeFile(workbook, 'exported_data.xlsx');
        } else {
            // Hiển thị thông báo lỗi nếu thông tin chưa đầy đủ
            alert('Please fill in all fields before exporting data.');
        }
    };

    return (
        <div>
            <Form {...layout} style={{ width: '' }} className="form-container-exprort-data">
                <Form.Item
                    label='Tên nhân viên'
                >
                    <Input value={formData.employeeName} onChange={(e) => handleChange(e, 'employeeName')} />
                </Form.Item>
                <Form.Item
                    label='Ca làm việc'
                >
                    <Input value={formData.shift} onChange={(e) => handleChange(e, 'shift')} />
                </Form.Item>
                <Form.Item
                    label='Tên rạp'
                >
                    <Input value={formData.cinemaName} onChange={(e) => handleChange(e, 'cinemaName')} />
                </Form.Item>
                <Form.Item
                    label='Tuổi'
                >
                    <Input value={formData.age} onChange={(e) => handleChange(e, 'age')} />
                </Form.Item>
                <Form.Item
                    label='Địa chỉ'
                >
                    <Input value={formData.address} onChange={(e) => handleChange(e, 'address')} />
                </Form.Item>
                <Form.Item
                    label='Ngày làm việc'
                >
                    <Input value={formData.workDate} onChange={(e) => handleChange(e, 'workDate')} />
                </Form.Item>
                <Form.Item  wrapperCol={{ offset: 8, span: 16 }}>
                    <Button onClick={handleExportData}>Export data</Button>
                </Form.Item>
            </Form>
        </div>
    );
}
