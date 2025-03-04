// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package cesium_test

//func Example_basicReadWrite() {
//	ctx := context.TODO()
//	db, err := cesium.Open("", cesium.MemBacked())
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	// Create two channels: one to store the timestamps for our sensor data and one to
//	// store the values themselves.
//	timeChannel := cesium.Channel{
//		Key:      1,
//		DataType: telem.TimeStampT,
//		IsIndex:  true,
//	}
//	sensorChannel := cesium.Channel{
//		Key:      2,
//		DataType: telem.Float64T,
//		Index:    1,
//	}
//	if err := db.CreateChannel(ctx, timeChannel, sensorChannel); err != nil {
//		log.Fatal(err)
//	}
//
//	// The first sample timestamp allows us to align the writes for our time data and
//	// our sensor data.
//	firstSampleTimeStamp := telem.Now()
//
//	// Define our data. Notice how the first value in the timestamp array is the
//	// firstSampleTimeStamp.
//	timestamps := telem.NewSecondsTSV(
//		firstSampleTimeStamp,
//		firstSampleTimeStamp.Add(1*telem.Second),
//		firstSampleTimeStamp.Add(2*telem.Second),
//		firstSampleTimeStamp.Add(3*telem.Second),
//	)
//	sensorData := telem.NewArrayV[float64](1, 2, 3, 4)
//
//	// Write our data.
//	if err := db.WriteArray(ctx, timeChannel.Key, firstSampleTimeStamp, timestamps); err != nil {
//		log.Fatal(err)
//	}
//	if err := db.WriteArray(ctx, sensorChannel.Key, firstSampleTimeStamp, sensorData); err != nil {
//		log.Fatal(err)
//	}
//
//	// Now it's time to read the data back. We define a time range with an inclusive
//	// starting bound and an exclusive ending bound.
//	timeRange := firstSampleTimeStamp.SpanRange(4 * telem.Second)
//
//	frame, err := db.Read(ctx, timeRange, timeChannel.Key, sensorChannel.Key)
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	// Get the sensor and time series from the returned frame.
//	fetchedSensorData := frame.Get(sensorChannel.Key)
//	fetchedTimeData := frame.Get(timeChannel.Key)
//	log.Println(fetchedTimeData)
//	log.Println(fetchedSensorData)
//}
