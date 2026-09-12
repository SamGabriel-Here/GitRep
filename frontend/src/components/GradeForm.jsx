export default function GradeForm({ value, onChange, onSubmit, onPickExample, examples, busy }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <>
      <form className="field" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="repo">
          GitHub repository
        </label>
        <input
          id="repo"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="github.com/owner/repo"
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button type="submit" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Reading
            </>
          ) : (
            "Grade"
          )}
        </button>
      </form>

      <p className="examples">
        <span>Try</span>
        {examples.map((example) => (
          <button
            className="example"
            key={example}
            onClick={() => onPickExample(example)}
            disabled={busy}
          >
            {example}
          </button>
        ))}
      </p>
    </>
  );
}
