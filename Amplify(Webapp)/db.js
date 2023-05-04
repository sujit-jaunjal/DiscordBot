import mysql from 'serverless-mysql';
const db = mysql({
  config: {
    host: '<host>',
    port: '<port-number>',
    database: '<database-name>',
    user: '<user>',
    password: '<password>'
  }
});

export default async function handler(req, res) {
  // extract the data to be inserted from the request body
  const { discourse_uname, discord_uname, apecoin_cnt, snapshot_cnt, reclaim_proof, trust_level, wallet_address, callback_id, template_url, template_timestamp, proof_timestamp } = req.body;

  try {
    // execute the query to insert the data
    const result = await db.query('INSERT INTO amplify (discourse_uname, discord_uname, apecoin_cnt, snapshot_cnt, reclaim_proof, trust_level, wallet_address, callback_id, template_url, template_timestamp, proof_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [discourse_uname, discord_uname, apecoin_cnt, snapshot_cnt, reclaim_proof, trust_level, wallet_address, callback_id, template_url, template_timestamp, proof_timestamp]);

    // release the connection back to the pool
    connection.release();

    res.status(200).json({ success: true, message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error inserting data' + error });
  }
}

// export default async function excuteQuery({ query, values }) {
//   try {
//     const results = await db.query(query, values);
//     await db.end();
//     return results;
//   } catch (error) {
//     return { error };
//   }
// }
