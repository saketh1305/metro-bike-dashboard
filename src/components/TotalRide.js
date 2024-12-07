import CountUp from 'react-countup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonBiking } from "@fortawesome/free-solid-svg-icons";
import { Statistic } from "antd";

const formatter = (value) => <CountUp end={value} separator="," />;
const TotalRides = ({ totalRides }) => {

    return(
    <Statistic
        title="Rides"
        value={totalRides} 
        prefix={<FontAwesomeIcon icon={faPersonBiking} />}
        formatter={formatter}
    />
    );
}

export default TotalRides;
