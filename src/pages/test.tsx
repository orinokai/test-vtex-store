const SSRPage = () => (
  <main>
    <h1>Test</h1>
  </main>
)

export default SSRPage

export function getServerData() {
  return {
    props: {},
  }
}
