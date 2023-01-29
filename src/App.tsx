import { useState } from 'react';
import { useQuery } from 'react-query';
import { Spinner } from 'react-bootstrap';

interface PartyItem {
  name: string;
  link: string;
}

interface PartyTheme {
  theme: string;
  items: PartyItem[];
}

const ChatGPTQuery = () => {
  const [theme, setTheme] = useState('');
  const [partyData, setPartyData] = useState<PartyTheme>({ theme: '', items: [] });

  const { isLoading, error, data } = useQuery<object, Error, object>(
    theme,
    async (key) => {
      // Make a request to the OpenAI API to query ChatGPT with the party theme
      const response = await fetch(`https://api.openai.com/v1/engines/davinci-codex/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          prompt: `What are the top 3 items available on Amazon for throwing a ${theme} party?`,
          max_tokens: 100
        })
      });

      // Get the items from the response
      const json = await response.json();
      const items = json.choices[0].text.split("\n").filter((i: string) => i.startsWith("- ") && i.includes("http"));
      const partyItems = items.map((i: string) => {
        const link = i.substring(i.indexOf("http"));
        const name = i.substring(2, i.indexOf("http") - 1);
        return { name, link };
      });
      setPartyData({ theme: key.toString(), items: partyItems });
    },
    {
      enabled: theme.length > 0,
      onSuccess: () => setTheme('')
    }
  );

  return (
    <div>
      <form>
        <input
          type="text"
          placeholder="Enter party theme"
          value={theme}
          onChange={e => setTheme(e.target.value)}
        />
        <button type="submit" onClick={() => setTheme(theme)}>
          Search
        </button>
        <button type="submit" onClick={() => setTheme('')}>
          Clear
        </button>
      </form>
      {isLoading ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : data ? (
        <>
          <h3>{partyData.theme} Party</h3>
          <ul>
            {partyData.items.map((item, index) => (
              <li key={index}>


                <a href={item.link}>{item.name}</a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div>Please enter a party theme</div>
      )}
    </div>
  );
}

export default ChatGPTQuery;