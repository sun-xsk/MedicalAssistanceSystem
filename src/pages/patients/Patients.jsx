import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, Table, ConfigProvider } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getMainShow } from "../../util/api/httpUtil";

//语言配置
import zhCN from "antd/es/locale/zh_CN";

//样式
import "antd/dist/antd.css";
import "./patients.scss";

export function Patients() {
	//hooks
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [dataList, setDataList] = useState({ rows: [], total: 0 });

	//antd相关配置
	const { RangePicker } = DatePicker;
	const [form] = Form.useForm();
	const columns = [
		{ title: "#", dataIndex: "index", key: "index" },
		{ title: "患者编号", dataIndex: "patientId", key: "patientId" },
		{ title: "性别", dataIndex: "patientSex", key: "patientSex" },
		{ title: "年龄", dataIndex: "patientAge", key: "patientAge" },
		{
			title: "检查编号",
			dataIndex: "seriesInstanceUID",
			key: "seriesInstanceUID",
		},
		{ title: "类型", dataIndex: "modality", key: "modality" },
		{ title: "检查时间", dataIndex: "studyDate", key: "studyDate" },
		{
			title: "检查描述",
			dataIndex: "examDescription",
			key: "examDescription",
		},
	];

	useEffect(() => {
		getMainShow()
			.then((res) => {
				console.log(res.data);
				setDataList(res.data);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);
	return (
		<div className="patientWrapper">
			<ConfigProvider locale={zhCN}>
				<div className="patientTitle">医学影像深度智能诊断系统</div>
				<div className="patientSearchBoxWrapper">
					<Form name="filter" form={form} className="patientSearchBox">
						<Form.Item name={"patientId"}>
							<Input name={"patientId"} placeholder="患者编号" />
						</Form.Item>
						<Form.Item name={"seriesInstanceUID"}>
							<Input placeholder="检查编号" />
						</Form.Item>
						<Form.Item name={"studyDate"}>
							<RangePicker />
						</Form.Item>
						<Button>检索</Button>
						<Button
							onClick={() => {
								form.resetFields();
							}}
						>
							重置
						</Button>
					</Form>
					<Button>
						<Link to={location.state} className="link">
							本地上传
						</Link>
					</Button>
				</div>
				<div className="patientTable">
					<Table
						loading={loading}
						columns={columns}
						rowClassName={"patientTableRow"}
						dataSource={dataList.rows.map((item, index) => ({
							...item,
							key: index + 1,
							index: index + 1,
						}))}
						onRow={(record) => {
							return {
								onClick: () => navigate(location.state, { state: { record } }),
								// onClick: () => getPatientDicom(record),
							};
						}}
						pagination={{
							style: { padding: "0 16px" },
							position: ["bottomLeft"],
							total: dataList.total,
							showTotal: (total) => <span>{`共 ${total} 条`}</span>,
							showQuickJumper: true,
							onChange: () => {},
							onShowQuickJump: (page) => {
								console.log(page);
							},
						}}
					></Table>
				</div>
			</ConfigProvider>
		</div>
	);
}
