const generatePDFCertificate = async (certificateData) => {
  // Create a new canvas element for PDF generation
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas dimensions (scaled down from original)
  canvas.width = 2480;
  canvas.height = 1748;

  // Clear canvas with white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create gradient border
  const borderGradient = ctx.createLinearGradient(
    0,
    0,
    canvas.width,
    canvas.height
  );
  borderGradient.addColorStop(0, "#3b82f6");
  borderGradient.addColorStop(0.25, "#8b5cf6");
  borderGradient.addColorStop(0.5, "#06b6d4");
  borderGradient.addColorStop(0.75, "#10b981");
  borderGradient.addColorStop(1, "#3b82f6");

  // Draw border (thickness scaled proportionally)
  ctx.lineWidth = 20; // Reduced from 30
  ctx.strokeStyle = borderGradient;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80); // Reduced margin

  // Draw decorative circle (position and size adjusted)
  const decorativeGradient = ctx.createRadialGradient(
    2200, // Adjusted x position
    250, // Adjusted y position
    0,
    2200,
    250,
    70 // Reduced radius
  );
  decorativeGradient.addColorStop(0, "#fbbf24");
  decorativeGradient.addColorStop(1, "#f59e0b");
  ctx.fillStyle = decorativeGradient;
  ctx.beginPath();
  ctx.arc(2200, 250, 70, 0, 2 * Math.PI);
  ctx.fill();

  // Draw trophy emoji (size reduced)
  ctx.font = "60px 'Poppins', sans-serif"; // Reduced from 80px
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("", 2200, 280); // Adjusted position

  // Main title with adjusted size
  ctx.font = "bold 90px 'Poppins', sans-serif"; // Reduced from 120px
  const titleGradient = ctx.createLinearGradient(0, 350, canvas.width, 350);
  titleGradient.addColorStop(0, "#1e40af");
  titleGradient.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = titleGradient;
  ctx.textAlign = "center";
  ctx.fillText("CERTIFICAT D'EXCELLENCE", canvas.width / 2, 350);

  // Subtitle with adjusted size
  ctx.font = "600 45px 'Poppins', sans-serif"; // Reduced from 60px
  ctx.fillStyle = "#6b7280";
  ctx.fillText("est décerné à", canvas.width / 2, 450);

  // Student name with adjusted size
  ctx.font = "bold 75px 'Poppins', sans-serif"; // Reduced from 100px
  const nameGradient = ctx.createLinearGradient(0, 600, canvas.width, 600);
  nameGradient.addColorStop(0, "#059669");
  nameGradient.addColorStop(1, "#0d9488");
  ctx.fillStyle = nameGradient;
  ctx.fillText(certificateData.studentName, canvas.width / 2, 600);

  // Course description with adjusted size
  ctx.font = "500 40px 'Poppins', sans-serif"; // Reduced from 50px
  ctx.fillStyle = "#6b7280";
  ctx.fillText(
    "pour avoir terminé avec succès le programme de formation",
    canvas.width / 2,
    700
  );

  // Course name with adjusted size
  ctx.font = "bold 55px 'Poppins', sans-serif"; // Reduced from 70px
  ctx.fillStyle = "#1f2937";
  const courseLines = certificateData.courseName.split(" ");
  let line1 = "";
  let line2 = "";
  const maxWidth = 2100; // Reduced from 3000

  for (let i = 0; i < courseLines.length; i++) {
    const testLine = line1 + courseLines[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      line2 = courseLines.slice(i).join(" ");
      break;
    }
    line1 = testLine;
  }

  if (line2) {
    ctx.fillText(line1.trim(), canvas.width / 2, 800);
    ctx.fillText(line2, canvas.width / 2, 900);
  } else {
    ctx.fillText(line1.trim(), canvas.width / 2, 850);
  }

  // Details section with adjusted sizes
  const detailsY = line2 ? 1000 : 950;
  ctx.font = "bold 40px 'Poppins', sans-serif"; // Reduced from 50px
  ctx.fillStyle = "#3b82f6";

  // Show score percentage with grade
  const scoreText = certificateData.quizScore
    ? `${certificateData.quizScore}% - ${certificateData.grade}`
    : certificateData.grade;
  ctx.fillText(scoreText, canvas.width / 2 - 300, detailsY);

  ctx.fillText(
    new Date(certificateData.completionDate).toLocaleDateString("fr-FR"),
    canvas.width / 2 + 300,
    detailsY
  );

  ctx.font = "500 30px 'Poppins', sans-serif"; // Reduced from 35px
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Résultat", canvas.width / 2 - 300, detailsY + 50);
  ctx.fillText("Date", canvas.width / 2 + 300, detailsY + 50);

  // Signatures with adjusted sizes and positions
  const signaturesY = canvas.height - 300;
  ctx.font = "bold 35px 'Poppins', sans-serif"; // Reduced from 45px
  ctx.fillStyle = "#374151";
  ctx.textAlign = "center";

  // Instructor signature
  ctx.fillText(
    certificateData.instructor,
    canvas.width / 2 - 500, // Reduced spacing
    signaturesY
  );
  ctx.font = "500 30px 'Poppins', sans-serif"; // Reduced from 35px
  ctx.fillStyle = "#6b7280";
  ctx.fillText(
    "Instructeur Certifié",
    canvas.width / 2 - 500,
    signaturesY + 40
  );

  // Institution signature
  ctx.font = "bold 35px 'Poppins', sans-serif";
  ctx.fillStyle = "#374151";
  ctx.fillText(
    certificateData.institution,
    canvas.width / 2 + 500,
    signaturesY
  );
  ctx.font = "500 30px 'Poppins', sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Institution", canvas.width / 2 + 500, signaturesY + 40);

  // Draw signature lines (shorter)
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 700, signaturesY - 30);
  ctx.lineTo(canvas.width / 2 - 300, signaturesY - 30);
  ctx.moveTo(canvas.width / 2 + 300, signaturesY - 30);
  ctx.lineTo(canvas.width / 2 + 700, signaturesY - 30);
  ctx.stroke();

  // Certificate ID with adjusted size
  ctx.font = "500 25px 'Poppins', sans-serif"; // Reduced from 30px
  ctx.fillStyle = "#9ca3af";
  ctx.textAlign = "right";
  ctx.fillText(
    `ID: ${certificateData.certificateId}`,
    canvas.width - 80,
    canvas.height - 80
  );

  return canvas;
};

export default generatePDFCertificate;
