import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function CustomTabs({ tabs, setSelected, children }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSelected(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} aria-label="custom tabs">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.title}
            label={
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.title}</span>
              </div>
            }
            {...a11yProps(index)}
          />
        ))}
      </Tabs>
      {children.map((child, index) => (
        <TabPanel key={index} value={value} index={index}>
          {child}
        </TabPanel>
      ))}
    </Box>
  );
}

CustomTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
  })).isRequired,
  setSelected: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
