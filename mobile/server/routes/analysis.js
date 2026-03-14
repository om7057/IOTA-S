const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.post('/analyze-queries', verifyToken, async (req, res) => {
  try {
    const { queries } = req.body;
    const userId = req.user.id;

    console.log('Received analyze request for user:', userId);
    console.log('Queries received:', JSON.stringify(queries, null, 2));

    if (!queries || !Array.isArray(queries)) {
      console.error('Invalid queries data received');
      return res.status(400).json({ error: 'Invalid queries data' });
    }

    const questions = queries.map(query => query.question);
    console.log('Extracted questions for analysis:', questions);

    try {
      console.log('Sending request to analysis server...');
      const analysisResponse = await fetch('https://f49f-34-138-175-138.ngrok-free.app/analyze_journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journals: questions
        })
      });

      console.log('Analysis server response status:', analysisResponse.status);

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Analysis server error response:', errorText);
        throw new Error(`Analysis server error: ${errorText}`);
      }

      const analysisResult = await analysisResponse.json();
      console.log('Analysis result received:', JSON.stringify(analysisResult, null, 2));

      if (!analysisResult.results || !Array.isArray(analysisResult.results)) {
        console.error('Invalid analysis result format:', analysisResult);
        throw new Error('Invalid analysis result format');
      }

      console.log('Deleting previous analysis results...');
      await db.query('DELETE FROM analysis_results WHERE user_id = $1', [userId]);

      const analysisData = analysisResult.results.map((result) => [
        userId,
        result['Journal Entry'],
        result['Detected Emotion'],
        result['Confidence Score'],
        result['Extracted Topic'],
        result['Personalized Feedback']
      ]);

      console.log('Prepared analysis data for storage:', JSON.stringify(analysisData, null, 2));

      for (const data of analysisData) {
        await db.query(
          `INSERT INTO analysis_results (user_id, query_text, detected_emotion, confidence_score, extracted_topic, personalized_feedback)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          data
        );
      }

      console.log('Successfully stored analysis results');
      res.json({ message: 'Analysis completed and results stored successfully' });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error('Error in analyze-queries endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:userId/analysis', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await db.query(
      'SELECT * FROM analysis_results WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;