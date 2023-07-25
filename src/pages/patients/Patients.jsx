import React, { useEffect, useState } from "react";
import {
	Form,
	Input,
	DatePicker,
	Button,
	Table,
	ConfigProvider,
	message,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { numberToTime } from "@/util/js/numberToTime";
import { getMainShow } from "@/util/api/httpUtil";
import zhCN from "antd/es/locale/zh_CN";

import "./patients.scss";

export function Patients() {
	const param = useParams();
	const part = param?.cate || "part1";
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [dataList, setDataList] = useState({ rows: [], total: 0 }); //全部数据
	const [searchDataList, setSearchDataList] = useState({ rows: [], total: 0 }); // 搜索到的数据

	const { RangePicker } = DatePicker;
	const [form] = Form.useForm();

	const columns = [
		{
			title: "#",
			dataIndex: "index",
			key: "index",
		},
		{
			title: "患者编号",
			dataIndex: "patientId",
			key: "patientId",
			render: (_, val) => {
				return val.patientId || "未知";
			},
		},
		{
			title: "患者姓名",
			dataIndex: "patientName",
			key: "patientName",
			render: (_, val) => {
				return val.patientName || "未知";
			},
		},
		{
			title: "性别",
			dataIndex: "patientSex",
			key: "patientSex",
			render: (_, val) => {
				return val.patientGender || "未知";
			},
		},
		{
			title: "年龄",
			dataIndex: "patientAge",
			key: "patientAge",
			render: (_, val) => {
				return val.patientAge || "未知";
			},
		},
		{
			title: "检查编号",
			dataIndex: "seriesInstanceUID",
			key: "seriesInstanceUID",
			render: (_, val) => {
				return val.seriesInstanceUID || "未知";
			},
		},
		{
			title: "类型",
			dataIndex: "modality",
			key: "modality",
			render: (_, val) => {
				return val.modality || "未知";
			},
		},
		{
			title: "检查时间",
			dataIndex: "studyDate",
			key: "studyDate",
			render: (_, val) => {
				return numberToTime(val.studyDate) || "未知";
			},
		},
		{
			title: "检查描述",
			dataIndex: "examDescription",
			key: "examDescription",
			render: (_, val) => {
				return val.examDescription || "未知";
			},
		},
		{
			title: "详情",
			dataIndex: "detail",
			key: "detail",
			render: (_, val) => {
				return (
					<Button
						onClick={() => {
							navigate(`/${part}/${val.seriesInstanceUID}`);
						}}
					>
						进入详细
					</Button>
				);
			},
		},
	];

	const onSearch = () => {
		setLoading(true);
		const fillData = form.getFieldsValue();
		const sourceData = dataList.rows;
		const fillTime = fillData.studyDate
			? fillData.studyDate.map((time) => time.format("YYYYMMDD").toString())
			: [];

		const filiterData = sourceData.filter((item) => {
			if (fillTime.length !== 0) {
				if (item.studyDate < fillTime[0] || item.studyDate > fillTime[1])
					return false;
			}
			for (const field in fillData) {
				if (fillData[field] && field !== "studyDate") {
					const isPass = fillData[field] === item[field] ? true : false;
					if (!isPass) return false;
				}
			}
			return true;
		});
		setSearchDataList({ rows: filiterData, total: filiterData.length });
		setLoading(false);
	};

	useEffect(() => {
		(async () => {
			setLoading(true);
			const res = await getMainShow();
			if (res && res.status === 200) {
				setDataList({ rows: res.data, total: res.data.length });
				setSearchDataList({ rows: res.data, total: res.data.length });
				setLoading(false);
			} else {
				message.error("网络出现错误");
			}
		})();
	}, []);

	return (
		<div className="patientWrapper">
			<ConfigProvider locale={zhCN}>
				<div className="patientTitle">医学影像深度智能诊断系统</div>
				<div className="patientSearchBoxWrapper">
					<Form
						name="filter"
						onFinish={onSearch}
						form={form}
						className="patientSearchBox"
					>
						<Form.Item name={"patientId"}>
							<Input name={"patientId"} placeholder="患者编号" />
						</Form.Item>
						<Form.Item name={"seriesInstanceUID"}>
							<Input placeholder="检查编号" />
						</Form.Item>
						<Form.Item name={"studyDate"}>
							<RangePicker format={"YYMMDD"} />
						</Form.Item>
						<Button htmlType="submit">检索</Button>
						<Button
							onClick={() => {
								setSearchDataList(dataList);
								form.resetFields();
							}}
						>
							重置
						</Button>
					</Form>
					<Button>
						<Link to={`/${part}/noId`} className="link">
							本地上传
						</Link>
					</Button>
				</div>
				<div className="patientTable">
					<Table
						loading={loading}
						columns={columns}
						rowClassName={"patientTableRow"}
						dataSource={searchDataList.rows.map((item, index) => ({
							...item,
							key: index + 1,
							index: index + 1,
						}))}
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
