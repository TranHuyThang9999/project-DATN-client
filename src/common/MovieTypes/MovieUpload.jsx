import { Button, Col, Form, Input, Row, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { showError, showSuccess, showWarning } from '../log/log';
import axios from 'axios';

export default function MovieAdd() {

    const [movieType, setMovieType] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/manager/user/movie/getlist');
            const data = response.data;
            if (data.result.code === 0) {
                setMovieType(data.movie);
                return;
            } else if (data.result.code === 20) {
                showWarning("data emplty");
                return;
            } else {
                console.error('Error retrieving cinemas');
                return;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showError("error ver");
            return;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    const [form] = Form.useForm();
    const handleFormSubmit = async (values) => {
        try {
            const formData = new FormData();

            formData.append('movieTypeName', values.movieTypeName.trim());

            // Send a POST request using Axios

            const response = await axios.post(
                'http://localhost:8080/manager/user/movie/add',
                formData,
                {
                    headers: {
                        // Authorization: token,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (response.data.result.code === 0) {
                fetchData();
                showSuccess('Tạo thành công');
                return;
            } else if (response.data.result.code === 40) {
                showWarning("Tên loại phim đã tồn tại");
                return;
            } else {
                showError("error server");
                return;
            }
        } catch (error) {
            console.log(error);
            showError("error server");
            return;
        }

    }


    const layout = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 16,
        },
    };
    const handlerDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8080/manager/user/movie/delete?id=${id}`);
            if (response.data.result.code === 0) {
                fetchData();
                showSuccess('Xóa thành công');
                return;
            } else if (response.data.result.code === 28) {
                showWarning('Lỗi từ client');
                return;
            } else if (response.data.result.code === 4) {
                showError('Lỗi từ server');
                return;
            } else {
                showError('Lỗi không xác định');
                return;
            }
        } catch (error) {
            showError('Lỗi server');
            console.log(error);
        }
    }

    const columns = [
        {
            title: 'Thể loại phim',
            dataIndex: 'movieTypeName',
            key: 'movieTypeName',
        },
        {
            title: '',
            key: 'action',
            render: (text, record) => (
                <Button onClick={() => handlerDelete(record.id)}>Xóa</Button>
            ),
        },
    ];

    return (
        <div>
            <Row>
                <Col style={{ padding: '0 16px' }}>
                    <Form
                        {...layout}
                        form={form}
                        onFinish={handleFormSubmit}
                    >
                        <Form.Item
                            label="Nhập loại phim"
                            className="form-row"
                            name="movieTypeName"
                            rules={[{ required: true, message: 'Vui lòng nhập loại phim!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col>
                    <Table dataSource={movieType} rowKey="id" columns={columns} />
                </Col>
            </Row>
        </div>
    )
}
