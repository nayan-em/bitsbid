import { useState, useEffect } from 'react'
import axios from 'axios'

import React from 'react'

import * as PusherPushNotifications from '@pusher/push-notifications-web'
import Pusher from 'pusher-js'

const { REACT_APP_SERVER_IP, REACT_APP_PORT, REACT_APP_PUSHER_CLUSTER, REACT_APP_PUSHER_KEY } = process.env

class Watchlist extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loaded: false,
            items: []
        }
        this.pusher = new Pusher(REACT_APP_PUSHER_KEY, {
            cluster: REACT_APP_PUSHER_CLUSTER
        });
        this.onItemBidUpdate = this.onItemBidUpdate.bind(this)
        this.channel = this.pusher.subscribe('item-bid');
        this.channel.bind('my-event', this.onItemBidUpdate);
        Pusher.logToConsole = true;
    }

    componentWillMount() {
        const fetchUrl = 'http://' + REACT_APP_SERVER_IP + ':' + REACT_APP_PORT + '/watchlist'
        const itemFetchUrl = "http://" + REACT_APP_SERVER_IP + ":" + REACT_APP_PORT + `/item`
        axios.get(fetchUrl)
        .then(async(res) => {
            this.setState(
                {
                    items:
                    await Promise.all(
                        res.data.map(
                            async(itemid) => {
                return (await axios.get(itemFetchUrl, {params: {id: itemid}})).data
            }))})
            this.setState({loaded: true})
        })
        .catch(err => console.log(err))
    }

    onItemBidUpdate(data) {
        const idArr = this.state.items.map(item => { return item._id })
        console.log(idArr)
        const changeIndex = idArr.indexOf(data.id)
        console.log(changeIndex)
        this.state.items[changeIndex].highestBid = data.bidAmount
        this.setState({items: this.state.items})
    }

    render() {
        return (
            <>
            <h1>Watchlist: </h1>
            {!this.state.loaded && <h1>Loading...</h1>}
            {this.state.loaded &&
            <ul>
                {this.state.items.map(item => {
                    return (<l1> {item.name} is selling for {item.highestBid} </l1>)
                })}
            </ul>}
            </>
        )
    }
}

export default Watchlist;