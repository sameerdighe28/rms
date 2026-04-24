import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateApi } from '../../services/endpoints';
import type { MockQuestionDTO, MockTestStartResponse, MockTestResultResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateMockTestPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [testData, setTestData] = useState<MockTestStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MockTestResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await candidateApi.startMockTest(applicationId!);
      setTestData(res.data);
      setStarted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to start test';
      toast.error(msg);
      if (msg.includes('already taken')) {
        // Try to load result instead
        try {
          const res = await candidateApi.getMockTestResult(applicationId!);
          setResult(res.data);
        } catch { /* ignore */ }
      }
    }
    finally { setLoading(false); }
  };

  const submitTest = async () => {
    if (!testData) return;
    const unanswered = testData.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;

    setLoading(true);
    try {
      const res = await candidateApi.submitMockTest(testData.attemptId, { answers });
      setResult(res.data);
      toast.success('Test submitted!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // Show result
  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Mock Test Result</h1>
          <button className="btn btn-outline" onClick={() => navigate('/candidate/applications')}>← Back to Applications</button>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Your Score</span>
            <span className={`badge ${percentage >= 70 ? 'badge-technical' : percentage >= 40 ? 'badge-non_technical' : 'badge-rejected'}`}>
              {percentage}%
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '16px 0' }}>
            {result.score} / {result.totalQuestions}
          </p>
          <p><strong>Category:</strong> {result.category.replace(/_/g, ' ')}</p>
          {result.completedAt && <p><strong>Completed:</strong> {new Date(result.completedAt).toLocaleString()}</p>}
          <p className="text-muted" style={{ marginTop: 12 }}>
            {percentage >= 70 ? '🎉 Excellent performance!' : percentage >= 40 ? '👍 Good effort, keep improving!' : '📚 Consider preparing more for such roles.'}
          </p>
        </div>
      </div>
    );
  }

  // Show test questions
  if (started && testData) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Mock Test — {testData.category.replace(/_/g, ' ')}</h1>
          <span className="text-muted">{Object.keys(answers).length}/{testData.totalQuestions} answered</span>
        </div>

        {testData.questions.map((q: MockQuestionDTO, idx: number) => (
          <div className="card" key={q.id} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 'bold', marginBottom: 12 }}>
              Q{idx + 1}. {q.questionText}
            </p>
            {['A', 'B', 'C', 'D'].map(opt => {
              const optionText = opt === 'A' ? q.optionA : opt === 'B' ? q.optionB : opt === 'C' ? q.optionC : q.optionD;
              const isSelected = answers[q.id] === opt;
              return (
                <label key={opt} style={{
                  display: 'block', padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
                  background: isSelected ? '#e0e7ff' : '#f9fafb', border: isSelected ? '2px solid #4f46e5' : '2px solid transparent',
                }}>
                  <input type="radio" name={q.id} value={opt} checked={isSelected}
                    onChange={() => selectAnswer(q.id, opt)}
                    style={{ marginRight: 8 }} />
                  <strong>{opt}.</strong> {optionText}
                </label>
              );
            })}
          </div>
        ))}

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <button className="btn btn-primary" disabled={loading} onClick={submitTest}>
            {loading ? 'Submitting...' : '✅ Submit Test'}
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mock Test</h1>
        <button className="btn btn-outline" onClick={() => navigate('/candidate/applications')}>← Back</button>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <h2>📝 Ready for Mock Test?</h2>
        <p className="text-muted" style={{ margin: '16px 0' }}>
          You will be given 10 multiple-choice questions based on the job role.<br />
          The test category is automatically determined from the job title.
        </p>
        <button className="btn btn-primary" disabled={loading} onClick={startTest}>
          {loading ? 'Starting...' : '🚀 Start Test'}
        </button>
      </div>
    </div>
  );
}

