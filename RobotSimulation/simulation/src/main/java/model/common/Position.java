package main.java.model.common;

/**
 * Represents a position in the environment
 */
public class Position {
    private double x;
    private double y;

    /**
     * Create a position at a coordinate
     * @param x the x coordinate
     * @param y the y coordinate
     */
    public Position(double x, double y){
        this.x = x;
        this.y = y;
    }

    /**
     * Get the x coordinate of the position
     * @return the x coordinate
     */
    public double getX(){
        return this.x;
    }

    /**
     * Get the y coordinate of the position
     * @return the y coordinate
     */
    public double getY(){
        return this.y;
    }

}