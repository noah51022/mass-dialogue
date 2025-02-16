require('dotenv').config();

import { use } from "react";
import ReportPage from "./ReportGenerate";

const main = () => {
    const [report, setReport] = useState('');

    const handleReportUpdate = (newReport) => {
        setReport(newReport);
    };

    return (
        <div>
            <ReportPage onReportUpdate={handleReportUpdate} />
            <AnotherComponent report={report} />
        </div>
    );
};

export default ParentComponent;