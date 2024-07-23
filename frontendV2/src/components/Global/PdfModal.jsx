import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfModal = ({ open, handleClose, pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: {
      xs: "95%", // 80% height on small screens
      md: "95%", // 70% height on medium screens and up
    },
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    overflow: "hidden", // Hide overflow
    display: "flex",
    flexDirection: "column",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
    mb: 2,
    pb: 1,
  };

  const footerStyle = {
    position: "relative",
    mt: "auto",
    pt: 2,
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "flex-end",
  };

  const documentContainerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    flex: 1,
    overflowY: "auto", // Vertical scroll only if needed
  };

  const documentStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    flexDirection: "column", // Stack pages vertically
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h6" component="h2">
            PDF Viewer
          </Typography>
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={documentContainerStyle}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={console.error}
            sx={documentStyle}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </Box>
        <Box sx={footerStyle}>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href={pdfUrl}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // Security improvement
            sx={{ textTransform: "none" }}
          >
            Open in New Tab
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PdfModal;
