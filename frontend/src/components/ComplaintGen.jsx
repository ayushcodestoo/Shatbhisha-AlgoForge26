import React, { useRef } from 'react';
import jsPDF from 'jspdf';

const ComplaintGen = ({ result, evidence }) => {
  const textAreaRef = useRef(null);

  const generateComplaintText = () => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
    const scamType = result?.scamTypes?.[0]?.type || 'Unknown Scam';
    const trustScore = result?.score || 0;
    const riskLevel = result?.scamTypes?.[0]?.riskLevel?.toUpperCase() || 'UNKNOWN';
    const messagePreview = result?.text?.slice(0, 300) || 'N/A';
    const evidenceList = evidence?.map((e, i) => `${i + 1}. ${e.originalName}`).join('\n') || 'None';

    return `CYBERCRIME INCIDENT REPORT
Generated via CyberSaathi

─────────────────────────────────────────────────────────

INCIDENT SUMMARY

Date & Time: ${timestamp}
Scam Type: ${scamType}
Risk Level: ${riskLevel}
Analysis Score: ${trustScore}/100
Classification: ${result?.label || 'Unknown'}


MESSAGE ANALYZED

"${messagePreview}${result?.text?.length > 300 ? '...' : ''}"


KEY INDICATORS

${result?.highlightedKeywords?.slice(0, 5).map((k, i) => `${i + 1}. ${k}`).join('\n') || '• Suspicious message patterns identified'}


RECOMMENDED ACTIONS

1. Do NOT respond to the message
2. Do NOT click any links or download attachments
3. Do NOT share personal or financial information
4. Block the sender immediately
5. Report to your bank if financial fraud suspected


EVIDENCE UPLOADED

${evidence && evidence.length > 0 ? `${evidence.length} file(s):\n${evidenceList}` : 'None'}


HOW TO FILE COMPLAINT

1. Visit: cybercrime.gov.in
2. Click: Register Complaint
3. Fill: Incident details using this report
4. Submit and save reference number


IMPORTANT CONTACTS

National Cybercrime Helpline: 1930
Cybercrime Portal: cybercrime.gov.in
Local Police: 100


─────────────────────────────────────────────────────────
CyberSaathi Fraud Detection System
Report to authorities within 2 hours for best recovery chances
─────────────────────────────────────────────────────────`;
  };

  const complaintText = generateComplaintText();

  const copyToClipboard = () => {
    textAreaRef.current?.select();
    document.execCommand('copy');
    alert('Complaint text copied to clipboard!');
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ format: 'a4' });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      const addTitle = (text) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(17, 24, 39); // Professional dark
        doc.text(text, margin, yPosition);
        yPosition += 8;
      };

      const addSectionHeader = (text) => {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(37, 99, 235); // Professional blue
        doc.text(text, margin, yPosition);
        yPosition += 1;
        // Underline
        doc.setDrawColor(37, 99, 235);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        doc.setTextColor(0, 0, 0);
      };

      const addLabel = (label, value) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(55, 65, 81); // Dark gray
        doc.text(label, margin, yPosition);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(17, 24, 39);
        const lines = doc.splitTextToSize(value, maxWidth - 50);
        lines.forEach((line, idx) => {
          doc.text(line, margin + 50, yPosition + (idx > 0 ? 5 : 0));
        });
        yPosition += Math.max(5, lines.length * 5) + 2;
      };

      const addContent = (text) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(55, 65, 81);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
          if (yPosition > pageHeight - margin - 5) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      };

      const addBulletPoint = (text) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(55, 65, 81);
        const lines = doc.splitTextToSize(text, maxWidth - 5);
        lines.forEach((line, index) => {
          if (yPosition > pageHeight - margin - 5) {
            doc.addPage();
            yPosition = margin;
          }
          const prefix = index === 0 ? '• ' : '  ';
          doc.text(prefix + line, margin + 3, yPosition);
          yPosition += 5;
        });
      };

      const checkNewPage = () => {
        if (yPosition > pageHeight - margin - 15) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // PAGE 1: HEADER
      addTitle('Cybercrime Incident Report');
      
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(107, 114, 128); // Gray
      doc.text(`Generated via CyberSaathi | ${timestamp}`, margin, yPosition);
      yPosition += 8;

      // Separator line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // SECTION 1: INCIDENT SUMMARY
      checkNewPage();
      addSectionHeader('INCIDENT SUMMARY');
      
      const timestamp2 = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
      const scamType = result?.scamTypes?.[0]?.type || 'Unknown';
      const trustScore = result?.score || 0;
      const riskLevel = result?.scamTypes?.[0]?.riskLevel?.toUpperCase() || 'UNKNOWN';

      addLabel('Date & Time:', timestamp2);
      addLabel('Scam Type:', scamType);
      addLabel('Risk Level:', riskLevel);
      addLabel('Analysis Score:', `${trustScore}/100 (Trust Level: ${result?.label || 'Unknown'})`);
      yPosition += 3;

      // SECTION 2: MESSAGE DETAILS
      checkNewPage();
      addSectionHeader('MESSAGE ANALYZED');
      
      const messagePreview = result?.text?.slice(0, 250) || 'N/A';
      const messageText = `"${messagePreview}${result?.text?.length > 250 ? '...' : ''}"`;
      addContent(messageText);
      yPosition += 3;

      // SECTION 3: KEY INDICATORS
      checkNewPage();
      addSectionHeader('KEY INDICATORS DETECTED');
      
      if (result?.highlightedKeywords && result.highlightedKeywords.length > 0) {
        result.highlightedKeywords.slice(0, 5).forEach(keyword => addBulletPoint(keyword));
      } else {
        addBulletPoint('Suspicious message patterns identified');
      }
      yPosition += 2;

      // SECTION 4: RECOMMENDED ACTIONS
      checkNewPage();
      addSectionHeader('RECOMMENDED IMMEDIATE ACTIONS');
      
      const actions = [
        'Do NOT respond to the message',
        'Do NOT click any links or download attachments',
        'Do NOT share personal or financial information',
        'Block the sender immediately',
        'Report to your bank if financial fraud is suspected'
      ];
      actions.forEach(action => addBulletPoint(action));
      yPosition += 2;

      // SECTION 5: EVIDENCE (if any)
      if (evidence && evidence.length > 0) {
        checkNewPage();
        addSectionHeader('EVIDENCE SUMMARY');
        addLabel('Files Uploaded:', evidence.length);
        evidence.forEach((e, i) => {
          addBulletPoint(`${i + 1}. ${e.originalName}`);
        });
        yPosition += 2;
      }

      // SECTION 6: HOW TO FILE COMPLAINT
      checkNewPage();
      addSectionHeader('FILING A COMPLAINT');
      
      const complaintSteps = [
        'Online: Visit cybercrime.gov.in > Register Complaint',
        'Bank: Contact your bank immediately if banking fraud involved',
        'Police: Visit local police station with this report',
        'Keep complaint reference number for follow-up'
      ];
      complaintSteps.forEach(step => addBulletPoint(step));
      yPosition += 3;

      // SECTION 7: IMPORTANT CONTACTS
      checkNewPage();
      addSectionHeader('IMPORTANT CONTACTS');
      
      const contacts = [
        'National Cybercrime Helpline: 1930',
        'Cybercrime Portal: cybercrime.gov.in',
        'Local Police Emergency: 100',
        'Bank Contact: Check your debit/credit card'
      ];
      contacts.forEach(contact => addBulletPoint(contact));
      yPosition += 2;

      // FOOTER
      checkNewPage();
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(107, 114, 128);
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text('CyberSaathi Fraud Detection System - Confidential Document', margin, pageHeight - 10);
      doc.text('This report is for official use. Report to authorities within 2 hours for best recovery chances.', margin, pageHeight - 5);

      doc.save('CyberSaathi-Incident-Report.pdf');
      alert('PDF report generated successfully!');
    } catch (error) {
      alert('Error generating PDF: ' + error.message);
      console.error('PDF error:', error);
    }
  };

  if (!result) {
    return (
      <div className="complaint-card empty">
        <div className="card-header">
          <h3>Generate Complaint Report</h3>
        </div>
        <p className="placeholder-text">Analyze a message first to generate a complaint</p>
      </div>
    );
  }

  return (
    <div className="complaint-card">
      <div className="card-header">
        <h3>Generate Complaint Report</h3>
        <p className="subtitle">Ready to submit to authorities</p>
      </div>

      <div className="complaint-actions">
        <button onClick={copyToClipboard} className="btn btn-secondary">
          Copy to Clipboard
        </button>
        <button onClick={downloadPDF} className="btn btn-secondary">
          Download as PDF
        </button>
      </div>

      <div className="complaint-text-box">
        <textarea
          ref={textAreaRef}
          readOnly
          className="complaint-textarea"
          value={complaintText}
        />
      </div>

      <div className="info-box">
        <p><strong>How to use:</strong> Download as PDF and attach to official complaints, or copy text to submit on cybercrime.gov.in</p>
      </div>
    </div>
  );
};

export default ComplaintGen;
