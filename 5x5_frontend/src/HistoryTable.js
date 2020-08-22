import React from 'react';

export default function HistoryTable() {
    // /api/workout/history

    return (
        <React.Fragment>
            <table>
                <tbody>
                    <tr>
                        <th>Exercise</th>
                        <th>A</th>
                        <th>Exercise</th>
                        <th>B</th>
                    </tr>
                    <tr>
                        <td>Squat</td>
                        <td>100</td>
                        <td>Squat</td>
                        <td>102.5</td>
                    </tr>

                    <tr>
                        <td>Bench</td>
                        <td>100</td>
                        <td>Press</td>
                        <td>100</td>
                    </tr>

                    <tr>
                        <td>Row</td>
                        <td>100</td>
                        <td>Deadlift</td>
                        <td>100</td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                    <tr>
                        <th>Exercise</th>
                        <th>date A</th>
                        <th>Exercise</th>
                        <th>date B</th>
                    </tr>
                    <tr>
                        <td>Squat</td>
                        <td>100</td>
                        <td>Squat</td>
                        <td>102.5</td>
                    </tr>

                    <tr>
                        <td>Bench</td>
                        <td>100</td>
                        <td>Press</td>
                        <td>100</td>
                    </tr>

                    <tr>
                        <td>Row</td>
                        <td>100</td>
                        <td>Deadlift</td>
                        <td>100</td>
                    </tr>
                </tbody>
            </table>
        </React.Fragment>
    )
}