const { checkSimilarity } = require("../utils/geminiHelper");

const getSimilarity = async (req, res) => {
  const { textA, textB } = req.body;

  try {
    const result = await checkSimilarity(textA, textB);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New endpoint for assignment similarity check (AI feature)
const checkAssignmentSimilarity = async (req, res) => {
  const { assignmentId } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ message: 'Assignment ID is required' });
  }

  try {
    // Mock AI response - in production, call actual similarity checking service
    // This could use Gemini API or another plagiarism detection service
    const mockSimilarityScore = Math.floor(Math.random() * 80) + 20; // 20-100%
    
    let riskLevel = 'low';
    let explanation = 'Submission shows unique content with minimal similarity to reference materials.';
    let flaggedSections = [];

    if (mockSimilarityScore >= 70) {
      riskLevel = 'high';
      explanation = 'High similarity detected. The submission contains significant portions that match reference solutions or other submissions.';
      flaggedSections = ['Algorithm implementation', 'Code structure', 'Function signatures'];
    } else if (mockSimilarityScore >= 40) {
      riskLevel = 'medium';
      explanation = 'Moderate similarity detected. Some sections match common patterns or reference materials. Review flagged areas.';
      flaggedSections = ['Design approach', 'Variable naming conventions'];
    }

    res.json({
      assignmentId,
      similarity: mockSimilarityScore,
      riskLevel,
      explanation,
      flaggedSections,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Similarity check error:', error);
    res.status(500).json({ message: 'Failed to run similarity check', error: error.message });
  }
};

module.exports = { getSimilarity, checkAssignmentSimilarity };
