import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { showError, showSuccess, showWarning } from '../common/log/log';
import { Button, DatePicker, Drawer, Form, InputNumber, Select } from 'antd';
import CinemasGetAll from '../common/cinemas/CinemasGetAll';
import './index.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
};

const disabledDate = (current) => {
    return current && current < dayjs().endOf('day');
};

const disabledDateTime = () => ({
    disabledHours: () => range(0, 24).splice(4, 20),
    disabledMinutes: () => range(30, 60),
    disabledSeconds: () => [55, 56],
});

export default function UpdateShowTimeById({ show_time_id}) {
    const [showTime, setShowTime] = useState(null);
    const [cinemaName, setCinemaName] = useState('');
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/manager/use/showtime?id=${show_time_id}`);
                if (response.data.result.code === 0) {
                    const fetchedShowTime = response.data.show_time;
                    const movieTime = dayjs(fetchedShowTime.movie_time * 1000); // Chuyển đổi từ Unix timestamp sang dayjs
                    setShowTime(fetchedShowTime);
                    form.setFieldsValue({
                        price: fetchedShowTime.price,
                        quantity: fetchedShowTime.quantity,
                        cinema_name: fetchedShowTime.cinema_name,
                        discount: fetchedShowTime.discount,
                        movie_time: movieTime,
                    });
                } else {
                    showError("error server");
                }
            } catch (error) {
                console.log(error);
                showError("error server");
            }
        };
        fetchData();
    }, [show_time_id, form]);

    const layout = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 16,
        },
    };

    const handleFormSubmit = async (values) => {
        try {
            const formData = new FormData();
            const timeRequest = values.movie_time.unix(); // Chuyển đổi dayjs object sang unix timestamp
            formData.append('id', show_time_id);
            formData.append('cinema_name', cinemaName);
            formData.append('movie_time', timeRequest);
            formData.append('quantity', values.quantity);
            formData.append('price', values.price);
            formData.append('discount', values.discount);

            const response = await axios.put(
                'http://localhost:8080/manager/user/showtime/update',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.result.code === 0) {
                showSuccess('Cập nhật thành công');
            } else if (response.data.result.code === 40) {
                showWarning("Suất chiếu đã tồn tại vui lòng chọn lại");
            } else {
                showError('Lỗi server, vui lòng thử lại');
            }
        } catch (error) {
            console.log(error);
            showError('Lỗi server, vui lòng thử lại');
        }
    };

    const options = CinemasGetAll().map(cinema => ({
        label: cinema.cinema_name,
        value: cinema.cinema_name,
    }));

    if (!showTime) {
        return null;
    }

    const handleUpdateClick = () => {
        setVisible(true);
    };

    const handleCloseDrawer = () => {
        setVisible(false);
    };

    return (
        <div>
            <Button onClick={handleUpdateClick}>Cập nhật</Button>
            <Drawer
                title="Cập nhật suất chiếu"
                width={500}
                onClose={handleCloseDrawer}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    style={{ width: '600px' }}
                    {...layout}
                    form={form}
                    className="form-container-update-show-time"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        remember: true,
                    }}
                >
                    <Form.Item
                        label="Nhập giá vé"
                        className="form-row"
                        name="price"
                    >
                        <InputNumber />
                    </Form.Item>

                    <Form.Item
                        label="Nhập số lượng vé trên 1 phòng"
                        className="form-row"
                        name="quantity"
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="Chọn phòng để chiếu phim"
                        className="form-row"
                        name="cinema_name"
                    >
                        <Select
                            defaultValue={showTime.cinema_name}
                            allowClear
                            options={options}
                            onChange={(value) => setCinemaName(value)}
                        />
                    </Form.Item>
                    <Form.Item
                        label='Giảm giá vé'
                        name="discount"
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="Thời gian chiếu"
                        name="movie_time"
                    >
                        <DatePicker
                            format="YYYY-MM-DD HH:mm:ss"
                            disabledDate={disabledDate}
                            disabledTime={disabledDateTime}
                            showTime={{
                                defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                            }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Cập nhật lại suất chiếu</Button>
                </Form>
            </Drawer>
        </div>
    );
}
