import resolveConfig from 'tailwindcss/resolveConfig';
export const formatDate = (date) => {
  // Get the month, day, and year
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export function dateFormatter(dateString) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate)) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function getInitials(fullName) {
  if (!fullName) {
    return "";
  }
  const names = fullName.split(" ");

  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());

  const initialsStr = initials.join("");

  return initialsStr;
}

export const PRIOTITYSTYELS = {
  high: "text-red-600",
  medium: "text-yellow-600",
  low: "text-blue-600",
};

export const TASK_TYPE = {
  "to-do": "bg-blue-600",
  "in-progress": "bg-yellow-600",
  completed: "bg-green-600",
};

export const REQUEST_TYPE = {
  "awaiting-approval": "bg-silver-600",
  approved: "bg-blue-600",
  "in-progress": "bg-yellow-600",
  rejected: "bg-red-600",
  "complete-requested": "bg-purple-600",
  completed: "bg-green-600",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];


export const tailwindConfig = () => {
  return resolveConfig('../tailwind.config.js')
}

export const chartColors = {
  textColor: {
    light: tailwindConfig().theme.colors.slate[400],
    dark: tailwindConfig().theme.colors.slate[500],
  },
  gridColor: {
    light: tailwindConfig().theme.colors.slate[100],
    dark: tailwindConfig().theme.colors.slate[700],
  },
  backdropColor: {
    light: tailwindConfig().theme.colors.white,
    dark: tailwindConfig().theme.colors.slate[800],
  },
  tooltipTitleColor: {
    light: tailwindConfig().theme.colors.slate[800],
    dark: tailwindConfig().theme.colors.slate[100],
  },
  tooltipBodyColor: {
    light: tailwindConfig().theme.colors.slate[800],
    dark: tailwindConfig().theme.colors.slate[100],
  },
  tooltipBgColor: {
    light: tailwindConfig().theme.colors.white,
    dark: tailwindConfig().theme.colors.slate[700],
  },
  tooltipBorderColor: {
    light: tailwindConfig().theme.colors.slate[200],
    dark: tailwindConfig().theme.colors.slate[600],
  },
  chartAreaBg: {
    light: tailwindConfig().theme.colors.slate[50],
    // dark: `rgba(${hexToRGB(tailwindConfig().theme.colors.slate[900])}, 0.24)`,
  },
};

export const formatValue = (value) => Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value);